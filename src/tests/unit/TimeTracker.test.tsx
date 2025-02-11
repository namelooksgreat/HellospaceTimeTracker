import { render, fireEvent, screen, act } from "@testing-library/react";
import TimeTracker from "@/components/TimeTracker";
import { useTimerStore } from "@/store/timerStore";

// Mock the store
jest.mock("@/store/timerStore");

describe("TimeTracker", () => {
  const mockProjects = [
    { id: "1", name: "Project 1", color: "#000", customer_id: "1" },
  ];
  const mockCustomers = [{ id: "1", name: "Customer 1" }];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("shows correct button states", () => {
    const mockStore = {
      state: "stopped",
      time: 0,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
    };

    (useTimerStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { getByText, rerender } = render(
      <TimeTracker projects={mockProjects} customers={mockCustomers} />,
    );

    // Initial state (stopped)
    expect(getByText("Start Timer")).toBeInTheDocument();

    // Running state
    mockStore.state = "running";
    rerender(<TimeTracker projects={mockProjects} customers={mockCustomers} />);
    expect(getByText("Pause Timer")).toBeInTheDocument();

    // Paused state
    mockStore.state = "paused";
    rerender(<TimeTracker projects={mockProjects} customers={mockCustomers} />);
    expect(getByText("Resume Timer")).toBeInTheDocument();
  });

  it("handles timer actions correctly", () => {
    const mockStore = {
      state: "stopped",
      time: 0,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
    };

    (useTimerStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { getByText } = render(
      <TimeTracker projects={mockProjects} customers={mockCustomers} />,
    );

    // Test start
    fireEvent.click(getByText("Start Timer"));
    expect(mockStore.start).toHaveBeenCalled();

    // Test pause
    mockStore.state = "running";
    fireEvent.click(getByText("Pause Timer"));
    expect(mockStore.pause).toHaveBeenCalled();

    // Test resume
    mockStore.state = "paused";
    fireEvent.click(getByText("Resume Timer"));
    expect(mockStore.resume).toHaveBeenCalled();
  });

  it("updates time display correctly", () => {
    let time = 0;
    const mockStore = {
      state: "running",
      time,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
    };

    (useTimerStore as unknown as jest.Mock).mockReturnValue(mockStore);

    const { getByText, rerender } = render(
      <TimeTracker projects={mockProjects} customers={mockCustomers} />,
    );

    expect(getByText("00 : 00 : 00")).toBeInTheDocument();

    // Advance time
    act(() => {
      mockStore.time = 65; // 1 minute 5 seconds
      rerender(
        <TimeTracker projects={mockProjects} customers={mockCustomers} />,
      );
    });

    expect(getByText("00 : 01 : 05")).toBeInTheDocument();
  });
});
