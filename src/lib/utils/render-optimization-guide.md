# React Rendering Performance Optimization Guide

## Common Performance Issues

1. **Unnecessary Re-renders**: Components re-rendering when their props or state haven't changed
2. **Expensive Calculations**: Performing heavy computations during render
3. **Large Component Trees**: Rendering large lists or deeply nested components
4. **Unoptimized Context Usage**: Context changes causing all consumers to re-render
5. **Inefficient Event Handlers**: Creating new function references on every render

## Optimization Techniques

### 1. Component Memoization

```jsx
// Use React.memo to prevent re-renders when props don't change
import { memo } from 'react';

const MyComponent = memo(function MyComponent(props) {
  // Component implementation
});

// With custom comparison function
const MyComponent = memo(
  function MyComponent(props) {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Return true if passing nextProps to render would return
    // the same result as passing prevProps to render
    return prevProps.id === nextProps.id;
  }
);
```

### 2. Memoizing Expensive Calculations

```jsx
import { useMemo } from 'react';

function MyComponent({ data }) {
  // Only recalculate when data changes
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
}
```

### 3. Stable Event Handlers

```jsx
import { useCallback } from 'react';

function MyComponent({ onSave }) {
  // Create a stable function reference
  const handleClick = useCallback(() => {
    // Handler implementation
  }, [/* dependencies */]);
  
  return <button onClick={handleClick}>Save</button>;
}
```

### 4. Virtualization for Long Lists

```jsx
import { useVirtualization } from '@/hooks/useVirtualization';

function MyList({ items }) {
  const { virtualItems, totalHeight, containerRef } = useVirtualization(items, {
    itemHeight: 50,
    overscan: 5,
  });
  
  return (
    <div ref={containerRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: totalHeight }}>
        {virtualItems.map(({ index, offsetTop, item }) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${offsetTop}px)`,
              width: '100%',
              height: '50px',
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. Code Splitting and Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 6. Optimizing Context

```jsx
// Split context into smaller, more focused contexts
const ThemeContext = createContext();
const UserContext = createContext();

// Use context selectors to prevent unnecessary re-renders
function useThemeColor() {
  const theme = useContext(ThemeContext);
  return theme.color;
}
```

### 7. Debouncing and Throttling

```jsx
import { debounce, throttle } from '@/lib/utils/debounce-throttle';

function SearchComponent() {
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((query) => {
      // Search implementation
    }, 300),
    []
  );
  
  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  );
}
```

### 8. Using Web Workers for Heavy Computations

```jsx
import { runInWorker } from '@/lib/utils/worker-utils';

function DataProcessor({ data }) {
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // Run heavy computation in a worker thread
    runInWorker(
      (data) => {
        // Heavy computation
        return processedData;
      },
      data
    ).then(setResult);
  }, [data]);
  
  return <div>{result}</div>;
}
```

## Performance Monitoring

### 1. Using React Profiler

```jsx
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  console.log(`Component ${id} took ${actualDuration}ms to render`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MyComponent />
    </Profiler>
  );
}
```

### 2. Custom Performance Hooks

```jsx
import { useRenderCount } from '@/hooks/useRenderCount';
import { useWhyDidYouUpdate } from '@/hooks/useWhyDidYouUpdate';

function MyComponent(props) {
  // Track render count
  const renderCount = useRenderCount('MyComponent');
  
  // Debug which props are causing re-renders
  useWhyDidYouUpdate('MyComponent', props);
  
  return <div>Rendered {renderCount} times</div>;
}
```

## Best Practices

1. **Keep Component State Local**: Move state as close as possible to where it's used
2. **Avoid Inline Function Definitions**: Use useCallback for event handlers
3. **Avoid Object Literals in JSX**: Create stable references with useMemo
4. **Use Fragment to Avoid Unnecessary Divs**: Reduces DOM nodes
5. **Implement Pagination or Virtualization**: For long lists
6. **Optimize Images**: Use proper sizing, lazy loading, and modern formats
7. **Use Web Workers**: For CPU-intensive tasks
8. **Measure Performance**: Use React Profiler and performance monitoring tools
9. **Avoid Synchronous Layout**: Batch DOM reads and writes
10. **Use Production Builds**: Always test performance in production mode

## Tools for Performance Analysis

1. React DevTools Profiler
2. Chrome Performance Tab
3. Lighthouse
4. Web Vitals
5. Custom performance monitoring

Remember: Always measure before optimizing, and focus on the most impactful improvements first.
