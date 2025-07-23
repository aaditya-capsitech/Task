import React, { useState } from 'react';
import { CommandBar } from '@fluentui/react/lib/CommandBar';
import type { ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import type { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Modal } from '@fluentui/react/lib/Modal';
import { DefaultButton, PrimaryButton, Text } from '@fluentui/react';
import { Stack } from '@fluentui/react/lib/Stack';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { BusinessStatus, FilterCriteria } from '../types/Enums';
import type { FilterCriteriaType } from '../types/Enums';

//   Criteria dropdown (only one option now)
const filterCriteriaOptions: IDropdownOption[] = [
  { key: FilterCriteria.BusinessType, text: 'Business type' },
];

//   Correct typing here
const valueOptionsMap: Record<FilterCriteriaType, IDropdownOption[]> = {
  businessType: [
    { key: 'LLP', text: 'LLP' },
    { key: 'Limited', text: 'Limited' },
    { key: 'Limited Partnership', text: 'Limited Partnership' },
    { key: 'Individual', text: 'Individual' },
    { key: 'Partnership', text: 'Partnership' },
  ],
};

const statusOptions: IDropdownOption[] = [
  { key: BusinessStatus.All, text: BusinessStatus.All },
  { key: BusinessStatus.Active, text: BusinessStatus.Active },
  { key: BusinessStatus.Inactive, text: BusinessStatus.Inactive },
];

type Props = {
  items: ICommandBarItemProps[];
  onStatusFilterChange: (status: string) => void;
  currentStatusFilter: string;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  onApplyFilter?: (criteria: FilterCriteriaType, value: string) => void;
  onClearFilter?: () => void;
  activeFilter?: { criteria: string; value: string } | null;
};

export const CommandBarComponent: React.FC<Props> = ({
  items,
  onStatusFilterChange,
  currentStatusFilter,
  onSearch,
  onRefresh,
  onApplyFilter,
  onClearFilter,
  activeFilter,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<FilterCriteriaType>();
  const [selectedValue, setSelectedValue] = useState<string | undefined>();

  const commandItems: ICommandBarItemProps[] = items.map((item) =>
    item.key === 'refresh'
      ? { ...item, onClick: () => onRefresh?.() }
      : item
  ).concat({
    key: 'filter',
    text: 'Add filter',
    iconProps: { iconName: 'Filter' },
    onClick: () => setIsFilterOpen(true),
  });

  return (
    <>
      <CommandBar
        items={commandItems}
        farItems={[
          {
            key: 'search',
            onRender: () => (
              <div style={{ marginRight: 8 }}>
                <SearchBox
                  placeholder="Search client..."
                  onChange={(_, newValue) => onSearch?.(newValue || '')}
                  styles={{
                    root: {
                      height: 32,
                      marginTop: 4,
                      width: 200,
                    },
                  }}
                />
              </div>
            ),
          },
          {
            key: 'status',
            onRender: () => (
              <Dropdown
                selectedKey={currentStatusFilter}
                options={statusOptions}
                onChange={(_, option) => {
                  if (option) onStatusFilterChange(option.key.toString());
                }}
                styles={{
                  root: { marginTop: 4, minWidth: 150 },
                  dropdown: { height: 32 },
                }}
              />
            ),
          },
        ]}
      />

      {activeFilter && (
        <Stack
          horizontal
          verticalAlign="center"
          tokens={{ childrenGap: 8 }}
          style={{ padding: '8px 0 12px 0', marginLeft: 4 }}
        >
          <Text variant="medium">
            Filter applied: <b>{activeFilter.criteria}</b> = <b>{activeFilter.value}</b>
          </Text>
          <DefaultButton
            text="Clear Filter"
            iconProps={{ iconName: 'Cancel' }}
            onClick={onClearFilter}
            styles={{
              root: { padding: '0 12px', height: 32 },
              label: { fontSize: 12 },
            }}
          />
        </Stack>
      )}

      <Modal
        isOpen={isFilterOpen}
        onDismiss={() => setIsFilterOpen(false)}
        isBlocking={false}
        styles={{ main: { width: 400, padding: 20 } }}
      >
        <h3>Add filter</h3>

        <Dropdown
          label="Criteria"
          required
          placeholder="Select"
          options={filterCriteriaOptions}
          selectedKey={selectedCriteria}
          onChange={(_, option) =>
            setSelectedCriteria(option?.key as FilterCriteriaType)
          }
        />

        {selectedCriteria && (
          <Dropdown
            label="Value"
            required
            placeholder="Select"
            options={valueOptionsMap[selectedCriteria] || []}
            selectedKey={selectedValue}
            onChange={(_, option) => setSelectedValue(option?.key.toString())}
            styles={{ root: { marginTop: 16 } }}
          />
        )}

        <Stack horizontal tokens={{ childrenGap: 10 }} style={{ marginTop: 20 }}>
          <DefaultButton text="Cancel" onClick={() => setIsFilterOpen(false)} />
          <PrimaryButton
            text="Apply"
            onClick={() => {
              if (selectedCriteria && selectedValue?.trim()) {
                onApplyFilter?.(selectedCriteria, selectedValue);
                setIsFilterOpen(false);
              }
            }}
            disabled={!selectedCriteria || !selectedValue}
          />
        </Stack>
      </Modal>
    </>
  );
};
