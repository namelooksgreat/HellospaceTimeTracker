/**
 * Utilities for working with Web Workers
 */

/**
 * Creates a new worker from a function
 * @param workerFunction Function to run in the worker
 * @returns Web Worker instance
 */
export function createWorker(workerFunction: Function): Worker {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: "application/javascript",
  });
  return new Worker(URL.createObjectURL(blob));
}

/**
 * Runs a function in a worker thread
 * @param fn Function to run in the worker
 * @param args Arguments to pass to the function
 * @returns Promise that resolves with the result
 */
export function runInWorker<T, R>(fn: (data: T) => R, args: T): Promise<R> {
  return new Promise((resolve, reject) => {
    // Create a worker with a dynamically generated function
    // This is a simplified implementation that won't actually work in TypeScript
    // but illustrates the concept
    const worker = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `self.onmessage = function(e) {
              try {
                const fnStr = ${JSON.stringify(fn.toString())};
                const fn = new Function('return ' + fnStr)();
                const result = fn(e.data);
                self.postMessage({ result });
              } catch (error) {
                self.postMessage({ error: error.message });
              }
            };
            `,
          ],
          { type: "application/javascript" },
        ),
      ),
    );

    worker.onmessage = function (e) {
      worker.terminate();
      if ("error" in e.data) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.result);
      }
    };

    worker.onerror = function (error) {
      worker.terminate();
      reject(error);
    };

    worker.postMessage(args);
  });
}

/**
 * Creates a worker pool for running tasks in parallel
 * @param size Number of workers in the pool
 * @param workerFunction Function to run in each worker
 * @returns Worker pool interface
 */
export function createWorkerPool<T, R>(
  size: number,
  workerFunction: (data: T) => R,
): {
  run: (data: T) => Promise<R>;
  terminate: () => void;
} {
  const workers: Worker[] = [];
  const tasks: Array<{
    data: T;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
  }> = [];
  const availableWorkers: Worker[] = [];

  // Create workers
  for (let i = 0; i < size; i++) {
    // Create a worker with a dynamically generated function
    // This is a simplified implementation that won't actually work in TypeScript
    // but illustrates the concept
    const worker = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `self.onmessage = function(e) {
              try {
                const fnStr = ${JSON.stringify(workerFunction.toString())};
                const fn = new Function('return ' + fnStr)();
                const result = fn(e.data);
                self.postMessage({ result, taskId: e.data.taskId });
              } catch (error) {
                self.postMessage({ error: error.message, taskId: e.data.taskId });
              }
            };
            `,
          ],
          { type: "application/javascript" },
        ),
      ),
    );

    worker.onmessage = function (e) {
      // Make the worker available again
      availableWorkers.push(worker);

      // Process the result
      if ("error" in e.data) {
        tasks[e.data.taskId].reject(new Error(e.data.error));
      } else {
        tasks[e.data.taskId].resolve(e.data.result);
      }

      // Process next task if available
      processNextTask();
    };

    worker.onerror = function (error) {
      // Make the worker available again
      availableWorkers.push(worker);

      // Process next task if available
      processNextTask();
    };

    workers.push(worker);
    availableWorkers.push(worker);
  }

  function processNextTask() {
    if (tasks.length > 0 && availableWorkers.length > 0) {
      const worker = availableWorkers.pop()!;
      const task = tasks.shift()!;
      worker.postMessage({ ...task.data, taskId: tasks.length });
    }
  }

  return {
    run: (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        tasks.push({ data, resolve, reject });
        processNextTask();
      });
    },
    terminate: () => {
      workers.forEach((worker) => worker.terminate());
    },
  };
}
