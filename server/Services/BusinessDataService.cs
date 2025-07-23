using MongoDB.Driver;
using server.Models;

namespace server.Services
{
    public class BusinessDataService
    {
        private readonly IMongoCollection<BusinessData> _collection;
        private readonly IMongoCollection<History> _historyCollection;
        private readonly IMongoCollection<Client> _clientCollection;

        public BusinessDataService(IMongoDatabase database)
        {
            _collection = database.GetCollection<BusinessData>("businessdata");
            _historyCollection = database.GetCollection<History>("history");
            _clientCollection = database.GetCollection<Client>("clients");
        }
        public async Task<(List<BusinessData> Items, long TotalCount)> GetFilteredAsync(
            string status, string role, string email, string? type, int page, int pageSize)
        {
            var builder = Builders<BusinessData>.Filter;
            FilterDefinition<BusinessData> filter = builder.Empty;

            if (status.ToLower() != "all" && Enum.TryParse<BusinessStatus>(status, true, out var parsedStatus))
            {
                filter &= builder.Eq(x => x.Status, parsedStatus);
            }

            if (!string.IsNullOrEmpty(type))
            {
                filter &= builder.Eq(x => x.Type, type);
            }

            if (role != "Admin")
            {
                filter &= builder.Eq(x => x.CreatedBy, email);
            }

            var totalCount = await _collection.CountDocumentsAsync(filter);

            var items = await _collection.Find(filter)
                .SortBy(x => x.Sno)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
        public async Task<BusinessData?> GetByIdAsync(string id)
        {
            return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task<int> GetNextSerialNumberAsync()
        {
            var last = await _collection
                .Find(x => x.Status == BusinessStatus.Active)
                .SortByDescending(x => x.Sno)
                .Limit(1)
                .FirstOrDefaultAsync();

            return (last?.Sno ?? 0) + 1;
        }

        public async Task<string> GenerateNextClientIdAsync()
        {
            var allClientIds = await _collection
                .Find(x => x.ClientId.StartsWith("CID-"))
                .Project(x => x.ClientId)
                .ToListAsync();

            int max = 0;
            foreach (var id in allClientIds)
            {
                if (!string.IsNullOrEmpty(id) && id.StartsWith("CID-"))
                {
                    var numberPart = id.Substring(4);
                    if (int.TryParse(numberPart, out int num) && num > max)
                        max = num;
                }
            }

            return $"CID-{max + 1}";
        }
        public async Task AddAsync(BusinessData data)
        {
            if (data.Status == default)
                data.Status = BusinessStatus.Active;

            data.Sno = await GetNextSerialNumberAsync();

            if (string.IsNullOrWhiteSpace(data.ClientId))
                data.ClientId = await GenerateNextClientIdAsync();

            await _collection.InsertOneAsync(data);

            var history = new History
            {
                BusinessId = data.Id!,
                PerformedBy = data.CreatedBy ?? "System",
                Message = $"Client/Business '{data.BusinessName}' created.",
                Timestamp = DateTime.UtcNow
            };

            await _historyCollection.InsertOneAsync(history);
        }
        public async Task<bool> UpdateAsync(string id, BusinessData updated, string performedBy)
        {
            var original = await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (original == null) return false;

            updated.ClientId = original.ClientId;
            updated.Sno = original.Sno;

            var messages = new List<string>();

            void LogChange(string label, string? oldVal, string? newVal)
            {
                if (oldVal != newVal && !(string.IsNullOrWhiteSpace(oldVal) && string.IsNullOrWhiteSpace(newVal)))
                {
                    messages.Add($"{label} changed from '{oldVal}' to '{newVal}' by {performedBy}");
                }
            }
            LogChange("Business Name", original.BusinessName, updated.BusinessName);
            LogChange("Type", original.Type, updated.Type);
            LogChange("Contact Person", original.ContactPerson, updated.ContactPerson);
            LogChange("Team", original.Team, updated.Team);
            LogChange("Manager", original.Manager, updated.Manager);
            LogChange("First Response", original.FirstResponse, updated.FirstResponse);
            LogChange("Email", original.Email, updated.Email);
            LogChange("Phone Number", original.PhoneNumber, updated.PhoneNumber);
            LogChange("Status", original.Status.ToString(), updated.Status.ToString());

            if (messages.Count > 0)
            {
                await _collection.ReplaceOneAsync(x => x.Id == id, updated);

                var historyLogs = messages.Select(msg => new History
                {
                    BusinessId = id,
                    PerformedBy = performedBy,
                    Message = msg,
                    Timestamp = DateTime.UtcNow
                });

                await _historyCollection.InsertManyAsync(historyLogs);
            }
            return true;
        }
        public async Task<bool> MarkInactiveAsync(string id)
        {
            var update = Builders<BusinessData>.Update.Set(x => x.Status, BusinessStatus.Inactive);
            var result = await _collection.UpdateOneAsync(x => x.Id == id, update);

            if (result.ModifiedCount == 0)
                return false;

            await ReorderSerialNumbersAsync();
            return true;
        }
        public async Task ReorderSerialNumbersAsync()
        {
            var activeItems = await _collection
                .Find(x => x.Status == BusinessStatus.Active)
                .SortBy(x => x.Sno)
                .ToListAsync();

            for (int i = 0; i < activeItems.Count; i++)
            {
                var expectedSno = i + 1;

                if (activeItems[i].Sno != expectedSno)
                {
                    var filter = Builders<BusinessData>.Filter.Eq(x => x.Id, activeItems[i].Id);
                    var update = Builders<BusinessData>.Update.Set(x => x.Sno, expectedSno);
                    await _collection.UpdateOneAsync(filter, update);
                }
            }
        }

        public async Task<bool> ToggleStatusAsync(string id)
        {
            var existing = await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (existing == null) return false;

            var newStatus = existing.Status == BusinessStatus.Active ? BusinessStatus.Inactive : BusinessStatus.Active;
            var update = Builders<BusinessData>.Update.Set(x => x.Status, newStatus);
            var result = await _collection.UpdateOneAsync(x => x.Id == id, update);

            if (newStatus == BusinessStatus.Inactive)
                await ReorderSerialNumbersAsync();

            return result.ModifiedCount > 0;
        }

        public async Task<List<BusinessData>> GetByIdsAsync(List<string> ids)
        {
            return await _collection.Find(x => ids.Contains(x.Id)).ToListAsync();
        }

        public async Task<List<dynamic>> GetBusinessesWithClientDetails(string clientId)
        {
            var filter = Builders<BusinessData>.Filter.Eq("ClientId", clientId);
            var businesses = await _collection.Find(filter).ToListAsync();

            return businesses.Select(b => new
            {
                b.Id,
                b.Sno,
                b.ClientId,
                b.BusinessName,
                b.Type,
                Status = b.Status.ToString(),
                b.Designation
            }).ToList<dynamic>();
        }

        public async Task<List<BusinessData>> GetByContactIdAsync(string contactId)
        {
            return await _collection.Find(b =>
                b.LinkedContactId == contactId && b.Status != BusinessStatus.Inactive
            ).ToListAsync();
        }

        public async Task<bool> RestoreBusinessAsync(string id)
        {
            var filter = Builders<BusinessData>.Filter.Eq(x => x.Id, id);
            var update = Builders<BusinessData>.Update.Set(x => x.Status, BusinessStatus.Active);
            var result = await _collection.UpdateOneAsync(filter, update);

            if (result.ModifiedCount == 0)
                return false;

            await ReorderSerialNumbersAsync();
            return true;
        }
        public async Task<List<BusinessData>> GetByClientIdAsync(string clientId)
        {
            var filter = Builders<BusinessData>.Filter.And(
                Builders<BusinessData>.Filter.Eq(x => x.ClientId, clientId),
                Builders<BusinessData>.Filter.Ne(x => x.Status, BusinessStatus.Inactive)
            );

            return await _collection.Find(filter).ToListAsync();
        }

    }
}
