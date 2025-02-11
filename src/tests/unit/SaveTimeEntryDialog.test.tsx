import { render } from "@testing-library/react";
import { fireEvent, screen } from "@testing-library/dom";
import { SaveTimeEntryDialog } from "@/components/SaveTimeEntryDialog";
import { useTimeEntryStore } from "@/store/timeEntryStore";

// Mock the store
jest.mock("@/store/timeEntryStore", () => ({
  useTimeEntryStore: jest.fn(),
}));

describe("SaveTimeEntryDialog", () => {
  const mockProjects = [
    {
      id: "project1",
      name: "Test Project",
      color: "#000000",
      customer_id: "customer1",
    },
  ];

  const mockCustomers = [{ id: "customer1", name: "Test Customer" }];

  const mockTags = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
  ];

  beforeEach(() => {
    const mockStore = {
      duration: 3600,
      setDuration: jest.fn(),
    };
    (useTimeEntryStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it("loads initial data correctly", () => {
    render(
      <SaveTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        taskName="Initial Task"
        projectId="project1"
        customerId="customer1"
        projects={mockProjects}
        customers={mockCustomers}
        availableTags={mockTags}
        duration={3600}
        onSave={() => {}}
      />,
    );

    expect(screen.getByDisplayValue("Initial Task")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Hours
    expect(screen.getByText("0")).toBeInTheDocument(); // Minutes
    expect(screen.getByText("0")).toBeInTheDocument(); // Seconds
  });

  it("prevents auto-focus on open", () => {
    render(
      <SaveTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        taskName=""
        projectId=""
        customerId=""
        projects={mockProjects}
        customers={mockCustomers}
        availableTags={mockTags}
        duration={0}
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
      <SaveTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        taskName=""
        projectId=""
        customerId=""
        projects={mockProjects}
        customers={mockCustomers}
        availableTags={mockTags}
        duration={3600}
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
      <SaveTimeEntryDialog
        open={true}
        onOpenChange={() => {}}
        taskName="Test Task"
        projectId="project1"
        customerId="customer1"
        projects={mockProjects}
        customers={mockCustomers}
        availableTags={mockTags}
        duration={3600}
        onSave={mockOnSave}
      />,
    );

    const saveButton = screen.getByText("Save Entry");
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      taskName: "Test Task",
      projectId: "project1",
      customerId: "customer1",
      description: "",
      tags: [],
      duration: 3600,
    });
  });
});
