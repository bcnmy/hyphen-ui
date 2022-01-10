import { useCallback, useEffect, useRef, useState } from "react";

export enum Status {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn;

export default function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): {
  value: T | undefined; // this is the output of the asyncFunction
  error: undefined | Error; // error, if any, during execution of the asyncFunciton
  status: Status;
  execute: ReplaceReturnType<typeof asyncFunction, Promise<void>>;
} {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<Error>();
  const [value, setValue] = useState<T>();

  // this ref is to ensure that only the latest execute() ends up making changes to the state
  const asyncFunctionRef = useRef<any>(null);

  const execute = useCallback(
    async (...args) => {
      if (!asyncFunction) return;

      setStatus(Status.PENDING);
      setError(undefined);

      await (async () => {
        asyncFunctionRef.current = asyncFunction;
        let result = await asyncFunction(...args);
        return [result, asyncFunction];
      })()
        .then(([value, asyncFunction]) => {
          // for any call to the useAsync hook, if execute is used more than once,
          // only act on state updates the latest execution
          if (asyncFunction !== asyncFunctionRef.current) return;
          setValue(value as T);
          setStatus(Status.SUCCESS);
        })
        .catch((e) => {
          setStatus(Status.ERROR);
          setValue(undefined);
          setError(e);
        });
    },
    [asyncFunction]
  );

  return { value, status, error, execute };
}
