import React from "react";
import TimeTracker from "./TimeTracker";
import Timeline from "./Timeline";

interface HomeProps {
  onTimeEntryStart?: () => void;
  onTimeEntryStop?: () => void;
  onTimeEntryEdit?: (id: string) => void;
  onTimeEntryDelete?: (id: string) => void;
  timeEntries?: Array<{
    id: string;
    taskName: string;
    projectName: string;
    duration: string;
    startTime: string;
    projectColor: string;
  }>;
}

const Home = ({
  onTimeEntryStart = () => {},
  onTimeEntryStop = () => {},
  onTimeEntryEdit = () => {},
  onTimeEntryDelete = () => {},
  timeEntries = [
    {
      id: "1",
      taskName: "Design Review",
      projectName: "Website Redesign",
      duration: "2h 15m",
      startTime: "9:00 AM",
      projectColor: "#4F46E5",
    },
    {
      id: "2",
      taskName: "Client Meeting",
      projectName: "Mobile App",
      duration: "1h 30m",
      startTime: "11:30 AM",
      projectColor: "#10B981",
    },
    {
      id: "3",
      taskName: "Code Review",
      projectName: "Backend API",
      duration: "45m",
      startTime: "2:00 PM",
      projectColor: "#F59E0B",
    },
  ],
}: HomeProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Timer</h1>
          <div className="flex gap-4">
            <button className="text-white bg-transparent p-2 rounded-full hover:bg-white/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4V20M4 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button className="text-white bg-transparent p-2 rounded-full hover:bg-white/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15C19.7 14.1 20 13.1 20 12C20 6.5 16.2 2 12 2C7.8 2 4 6.5 4 12C4 17.5 7.8 22 12 22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <TimeTracker
            onStart={onTimeEntryStart}
            onStop={onTimeEntryStop}
            projects={[
              { id: "1", name: "Website Redesign", color: "#4F46E5" },
              { id: "2", name: "Mobile App", color: "#10B981" },
              { id: "3", name: "Backend API", color: "#F59E0B" },
            ]}
          />

          <Timeline
            entries={timeEntries}
            onEditEntry={onTimeEntryEdit}
            onDeleteEntry={onTimeEntryDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
