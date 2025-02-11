import { render } from "@testing-library/react";
import { fireEvent, screen } from "@testing-library/dom";
import { EditTimeEntryDialog } from "@/components/EditTimeEntryDialog";
import { useTimeEntryStore } from "@/store/timeEntryStore";

// Mock the store
jest.mock("@/store/timeEntryStore", () => ({
  useTimeEntryStore: jest.fn(),
}));

describe("EditTimeEntryDialog", () => {
  const mockEntry = {
    id: "1",
    task_name: "Test Task",
    duration: 3600, // 1 hour
    start_time: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: "user1",
    project: {
      id: "project1",
      name: "Test Project",
      color: "#000000",
      customer_id: "customer1",
    },
  };

  const mockProjects = [
    {
      id: "project1",
      name: "Test Project",
      color: "#000000",
      customer_id: "customer1",
    },
  ];

  const mockCustomers = [{ id: "customer1", name: "Test Customer" }];

  beforeEach(() => {
    const mockStore = {
      duration: 3600,
      setDuration: jest.fn(),
    };
    (useTimeEntryStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it("loads entry data correctly", () => {
    render(
      <EditTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        entry={mockEntry}
        projects={mockProjects}
        customers={mockCustomers}
        onSave={() => {}}
      />,
    );

    expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Hours
    expect(screen.getByText("0")).toBeInTheDocument(); // Minutes
    expect(screen.getByText("0")).toBeInTheDocument(); // Seconds
  });

  it("prevents auto-focus on open", () => {
    render(
      <EditTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        entry={mockEntry}
        projects={mockProjects}
        customers={mockCustomers}
        onSave={() => {}}
      />,
    );

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(document.activeElement).not.toBe(input);
    });
  });

  it("updates duration correctly", () => {
    const mockSetDuration = jest.fn();
    (useTimeEntryStore as unknown as jest.Mock).mockReturnValue({
      duration: 3600,
      setDuration: mockSetDuration,
    });

    render(
      <EditTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        entry={mockEntry}
        projects={mockProjects}
        customers={mockCustomers}
        onSave={() => {}}
      />,
    );

    // Change hours input
    const hoursInput = screen.getByDisplayValue("1");
    fireEvent.change(hoursInput, { target: { value: "2" } });

    expect(mockSetDuration).toHaveBeenCalledWith(7200); // 2 hours in seconds
  });

  it("calls onSave with correct data", () => {
    const mockOnSave = jest.fn();
    render(
      <EditTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        entry={mockEntry}
        projects={mockProjects}
        customers={mockCustomers}
        onSave={mockOnSave}
      />,
    );

    const saveButton = screen.getByText("Save Changes");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      taskName: "Test Task",
      projectId: "project1",
      customerId: "customer1",
      description: "",
      duration: 3600,
    });
  });
});
