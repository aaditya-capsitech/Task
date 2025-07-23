using MongoDB.Driver;
using server.Models;

namespace server.Services
{
    public class ContactService
    {
        private readonly IMongoCollection<Contact> _contacts;
        private readonly IMongoCollection<BusinessData> _businessCollection;
        private readonly IMongoCollection<History> _historyCollection;

        public ContactService(IMongoDatabase database)
        {
            _contacts = database.GetCollection<Contact>("contacts");
            _businessCollection = database.GetCollection<BusinessData>("businessdata");
            _historyCollection = database.GetCollection<History>("history");
        }

        // Create a contact with multiple businesses and log history
        public async Task CreateWithHistoryAsync(Contact contact, string performedBy)
        {
            if (contact == null)
                throw new ArgumentNullException(nameof(contact));

            if (contact.Businesses == null || contact.Businesses.Count == 0)
                throw new Exception("At least one business must be linked to the contact.");

            // Use the first business to get ClientId
            var firstBusinessId = contact.Businesses[0].Id;
            var firstBusiness = await _businessCollection.Find(b => b.Id == firstBusinessId).FirstOrDefaultAsync();

            if (firstBusiness == null)
                throw new Exception("First linked business not found.");

            contact.ClientId = firstBusiness.ClientId;

            await _contacts.InsertOneAsync(contact);

            var historyLogs = contact.Businesses.Select(b => new History
            {
                BusinessId = b.Id!,
                Message = $"Contact '{contact.Name}' created and linked to business '{b.Name}'.",
                PerformedBy = performedBy,
                Timestamp = DateTime.UtcNow
            });

            await _historyCollection.InsertManyAsync(historyLogs);
        }

        // Get contacts by businessId (even if linked via list)
        public async Task<List<Contact>> GetByBusinessIdAsync(string businessId)
        {
            var filter = Builders<Contact>.Filter.ElemMatch(
                c => c.Businesses,
                b => b.Id == businessId
            );

            return await _contacts.Find(filter).ToListAsync();
        }

        // Get a single contact by contact ID
        public async Task<Contact?> GetByIdAsync(string id)
        {
            return await _contacts.Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        // Get all contacts
        public async Task<List<Contact>> GetAllAsync()
        {
            return await _contacts.Find(_ => true).ToListAsync();
        }

        // for linking businesses
        public async Task<bool> UpdateRawAsync(FilterDefinition<Contact> filter, UpdateDefinition<Contact> update)
        {
            var result = await _contacts.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateAsync(Contact updatedContact)
        {
            var filter = Builders<Contact>.Filter.Eq(c => c.Id, updatedContact.Id);
            var update = Builders<Contact>.Update
                .Set(c => c.Email, updatedContact.Email)
                .Set(c => c.Phone, updatedContact.Phone)
                .Set(c => c.Designation, updatedContact.Designation)
                .Set(c => c.Type, updatedContact.Type)
                .Set(c => c.Story, updatedContact.Story);

            var result = await _contacts.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }
      public async Task RefreshAsync()
{
    // Optional: reload logic here (e.g., sync with external API)
    Console.WriteLine("Refresh triggered.");
}


    }
}
