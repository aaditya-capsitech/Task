import React, { useEffect, useState } from "react";
import {
  Stack,
  TextField,
  Label,
  Panel,
  PanelType,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  IconButton,
} from "@fluentui/react";
import type { IDropdownOption } from "@fluentui/react";

interface BusinessForm {
  type: string;
  businessId: string;
  collapsed: boolean;
}

interface BusinessData {
  id: string;
  businessName: string;
  type: string;
}

interface Props {
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

const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const ContactCreateForm: React.FC<Props> = ({ isOpen, onDismiss, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [story, setStory] = useState("");

  const [businesses, setBusinesses] = useState<BusinessForm[]>([
    { type: "Limited", businessId: "", collapsed: false },
  ]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessData[]>([]);
  const [filteredOptionsList, setFilteredOptionsList] = useState<IDropdownOption[][]>([]);

  type Business = {
    id: string;
    businessName: string;
    type: string;
  };

  useEffect(() => {
    if (!isOpen) return;

    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:5288/api/businessdata?status=active`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        const data: Business[] =
          Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
              ? result.data
              : [];

        setAllBusinesses(data);

        const initialOptions = businesses.map((biz) =>
          data
            .filter((b) => b.type === biz.type)
            .map((b) => ({ key: b.id, text: b.businessName }))
        );

        setFilteredOptionsList(initialOptions);
      })

      .catch((err) => {
        console.error("Failed to fetch businesses", err);
        setAllBusinesses([]);
      });
  }, [isOpen]);


  const handleBusinessChange = (
    index: number,
    field: keyof BusinessForm,
    value: string
  ) => {
    const updated = [...businesses];
    const item = { ...updated[index] };

    if (field === "type") {
      item.type = value;
      item.businessId = ""; // reset ID when type changes

      const filtered = Array.isArray(allBusinesses)
        ? allBusinesses
          .filter((b) => b.type === value)
          .map((b) => ({ key: b.id, text: b.businessName }))
        : [];

      const newOptions = [...filteredOptionsList];
      newOptions[index] = filtered;
      setFilteredOptionsList(newOptions);
    } else if (field === "businessId") {
      item.businessId = value;
    }

    updated[index] = item;
    setBusinesses(updated);
  };

  const addBusiness = () => {
    const newBiz: BusinessForm = { type: "Limited", businessId: "", collapsed: false };
    setBusinesses(prev => [...prev, newBiz]);

    const filtered = Array.isArray(allBusinesses)
      ? allBusinesses
        .filter((b) => b.type === newBiz.type)
        .map((b) => ({ key: b.id, text: b.businessName }))
      : [];

    setFilteredOptionsList(prev => [...prev, filtered]);
  };


  const removeBusiness = (index: number) => {
    setBusinesses(businesses.filter((_, i) => i !== index));
    setFilteredOptionsList(filteredOptionsList.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("token");

    const formattedBusinesses = businesses
      .filter((b) => b.businessId)
      .map((b) => {
        const found = allBusinesses.find((biz) => biz.id === b.businessId);
        return {
          id: b.businessId,
          name: found?.businessName || "",
        };
      });

    const contactType = businesses[0]?.type || "";

    if (!contactType) {
      alert("Please select a type for the first business.");
      return;
    }

    if (formattedBusinesses.length === 0) {
      alert("Please select at least one business.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5288/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          designation,
          story,
          type: contactType,
          businesses: formattedBusinesses,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      onSave();
      onDismiss();
    } catch (err) {
      console.error("Save error", err);
      alert("Failed to save contact.");
    }
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      headerText="Add Contact"
      closeButtonAriaLabel="Close"
      type={PanelType.medium}
      onRenderFooterContent={() => (
        <Stack horizontal tokens={{ childrenGap: 8 }} horizontalAlign="end">
          <DefaultButton text="Cancel" onClick={onDismiss} />
          <PrimaryButton text="Save" onClick={handleSubmit} />
        </Stack>
      )}
      isFooterAtBottom
    >
      <Stack tokens={{ childrenGap: 16 }}>
        <TextField label="Name" value={name} onChange={(_, v) => setName(capitalizeFirst(v || ""))} />
        <TextField label="Email" value={email} onChange={(_, v) => setEmail(v || "")} />
        <TextField label="Phone" value={phone} onChange={(_, v) => setPhone(v || "")} />
        <TextField label="Designation" value={designation} onChange={(_, v) => setDesignation(capitalizeFirst(v || ""))} />
        <TextField label="Story" multiline rows={3} value={story} onChange={(_, v) => setStory(v || "")} />

        <Label>Business Links</Label>
        {businesses.map((biz, index) => {
          const isLast = index === businesses.length - 1;
          return (
            <Stack key={index} tokens={{ childrenGap: 8 }}>
              <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
                <Dropdown
                  label="Type"
                  options={businessTypeOptions}
                  selectedKey={biz.type}
                  onChange={(_, opt) =>
                    handleBusinessChange(index, "type", opt?.key as string)
                  }
                  styles={{ dropdown: { width: 160 } }}
                />

                <Dropdown
                  label="Business Name"
                  placeholder="Select a business"
                  options={filteredOptionsList[index] || []}
                  selectedKey={biz.businessId || undefined}
                  onChange={(_, option) => {
                    if (option) {
                      handleBusinessChange(index, "businessId", option.key as string);
                    }
                  }}
                  styles={{ dropdown: { width: "100%" } }}
                />
                <IconButton
                  iconProps={{ iconName: isLast ? "Add" : "Delete" }}
                  onClick={() => (isLast ? addBusiness() : removeBusiness(index))}
                  styles={{ root : { marginTop : 28, }, }}
                />
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Panel>
  );
};

export default ContactCreateForm;
