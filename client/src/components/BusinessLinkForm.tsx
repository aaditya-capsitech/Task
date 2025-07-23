import React, { useEffect, useState } from "react";
import {
  Stack,
  Dropdown,
  IconButton,
  PrimaryButton,
  DefaultButton,
  Label,
  Panel,
  PanelType,
} from "@fluentui/react";
import type { IDropdownOption } from "@fluentui/react/lib/Dropdown";

interface BusinessForm {
  type: string;
  businessId: string;
  businessName: string;
}

interface BusinessData {
  id: string;
  businessName: string;
  type: string;
  status?: string;
}

interface BusinessLinkFormProps {
  contact: {
    _id: string;
    clientId: string;
    name: string;
    businesses?: { id: string; name: string }[];
    designation?: string;
    email?: string;
  };
  isOpen: boolean;
  onDismiss: () => void;
  onSave: () => void;
}

const businessTypeOptions: IDropdownOption[] = [
  { key: "LLP", text: "LLP" },
  { key: "Limited", text: "Limited" },
  { key: "Limited Partnership", text: "Limited Partnership" },
  { key: "Individual", text: "Individual" },
  { key: "Partnership", text: "Partnership" },
];

const BusinessLinkForm: React.FC<BusinessLinkFormProps> = ({
  contact,
  isOpen,
  onDismiss,
  onSave,
}) => {
  const [businesses, setBusinesses] = useState<BusinessForm[]>([
    { type: "Limited", businessId: "", businessName: "" },
  ]);

  const [allBusinesses, setAllBusinesses] = useState<BusinessData[]>([]);
  const [filteredOptionsList, setFilteredOptionsList] = useState<IDropdownOption[][]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const token = sessionStorage.getItem("token");
    const existingBusinessIds = (contact.businesses ?? []).map((b) => String(b.id));

    fetch(`http://localhost:5288/api/businessdata?status=active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Failed to fetch");
        if (!text) return [];
        return JSON.parse(text);
      })
      .then((data: any) => {
        console.log("Fetched business data:", data);

        if (!Array.isArray(data.data)) {
          throw new Error("Invalid data format: expected an array in 'data'.");
        }

        setAllBusinesses(data.data); //FIXED: use data.data here

        const initialOptions = businesses.map((biz) =>
          data.data
            .filter(
              (b: any) => b.type === biz.type && !existingBusinessIds.includes(String(b.id))
            )
            .map((b: any) => ({ key: String(b.id), text: b.businessName }))
        );
        setFilteredOptionsList(initialOptions);
      })


      .catch((err) => {
        console.error("Error fetching businesses", err);
      });
  }, [isOpen]);

  const handleChange = (index: number, field: keyof BusinessForm, value: string) => {
    const updated = [...businesses];
    updated[index] = { ...businesses[index], [field]: value };
    console.log(`handleChange [${index}] ${field} = ${value}`);
    // setBusinesses(updated);
    
    // If type changes, update dropdown options
    if (field === "type") {
      updated[index].businessId = "";
      updated[index].businessName = "";

      const filtered = allBusinesses
        .filter((b) => b.type === value)
        .map((b) => ({ key: b.id, text: b.businessName }));

      const updatedOptions = [...filteredOptionsList];
      updatedOptions[index] = filtered;
      setFilteredOptionsList(updatedOptions);
    }

    setBusinesses(updated);
  };
  const addBusinessField = () => {
    const newBusiness = { type: "Limited", businessId: "", businessName: "" };
    const updatedBusinesses = [...businesses, newBusiness];
    setBusinesses(updatedBusinesses);

    const existingBusinessIds = (contact.businesses ?? []).map((b) => String(b.id));

    const newOptions = allBusinesses
      .filter(
        (b) => b.type === newBusiness.type && !existingBusinessIds.includes(String(b.id))
      )
      .map((b) => ({ key: String(b.id), text: b.businessName }));

    setFilteredOptionsList([...filteredOptionsList, newOptions]);
  };

  const removeBusinessField = (index: number) => {
    setBusinesses(businesses.filter((_, i) => i !== index));
    setFilteredOptionsList(filteredOptionsList.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("token");
    const existingBusinessIds = (contact.businesses ?? []).map((b) => String(b.id));

    const businessesToLink = businesses
      .filter(
        (b) =>
          b.businessId &&
          b.businessName &&
          !existingBusinessIds.includes(String(b.businessId))
      )
      .map((b) => ({
        id: b.businessId,
        name: b.businessName,
      }));

    console.log("Existing linked IDs:", existingBusinessIds);
    console.log("Selected form data:", businesses);
    console.log("Filtered businesses to link:", businessesToLink);

    if (businessesToLink.length === 0) {
      alert("Selected business is already linked or empty.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5288/api/contacts/${contact._id}/link-businesses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(businessesToLink),
        }
      );

      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);

      onSave();
      onDismiss();
    } catch (err) {
      console.error("Error linking businesses:", err);
      alert("Failed to link businesses.");
    }
  };

  const renderFooter = () => (
    <Stack horizontal tokens={{ childrenGap: 12 }} horizontalAlign="end">
      <DefaultButton text="Cancel" onClick={onDismiss} />
      <PrimaryButton text="Save" onClick={handleSubmit} />
    </Stack>
  );

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={() => {
        document.activeElement && (document.activeElement as HTMLElement).blur();
        onDismiss();
      }}
      headerText="Link Businesses"
      closeButtonAriaLabel="Close"
      type={PanelType.medium}
      onRenderFooterContent={renderFooter}
      isFooterAtBottom={true}
    >
      <Stack tokens={{ childrenGap: 16 }}>
        {businesses.map((biz, index) => {
          const isLast = index === businesses.length - 1;

          return (
            <Stack horizontal tokens={{ childrenGap: 16 }} key={index} verticalAlign="end">
              <Stack styles={{ root: { width: 180 } }}>
                <Label>Type</Label>
                <Dropdown
                  options={businessTypeOptions}
                  selectedKey={biz.type}
                  onChange={(_, option) => {
                    if (option) {
                      handleChange(index, "type", option.key as string);
                    }
                  }}
                />
              </Stack>

              <Stack styles={{ root: { flexGrow: 1 } }}>
                <Label>Business Name</Label>
                <Dropdown
                  options={filteredOptionsList[index] || []}
                  selectedKey={biz.businessId || undefined}
                  onChange={(_, option) => {
                    if (option) {
                      const businessId = option.key as string;
                      const businessName = option.text;

                      const updated = [...businesses];
                      //save the previous index value so that it doesnot get losst when i update it again
                      updated[index] = {
                        ...updated[index],
                        businessId,
                        businessName,
                      };
                      setBusinesses(updated);

                      console.log("Selected businessId:", businessId);
                      console.log("Selected businessName:", businessName);
                    } else {
                      console.warn("No option selected or option is undefined");
                    }
                  }}

                  placeholder="Select a business"
                />
              </Stack>
              <IconButton
                iconProps={{ iconName: isLast ? "Add" : "Delete" }}
                title={isLast ? "Add" : "Delete"}
                ariaLabel={isLast ? "Add" : "Delete"}
                onClick={() => (isLast ? addBusinessField() : removeBusinessField(index))}
                styles={{ root: { marginTop: 26 } }}
              />
            </Stack>
          );
        })}
      </Stack>
    </Panel>
  );
};

export default BusinessLinkForm;
