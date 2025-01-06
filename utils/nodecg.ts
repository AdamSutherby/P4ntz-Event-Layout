import React from 'react';

declare global {
    interface Window {
      nodecg: any;
    }
  }
  
  export function getNodeCG() {
    if (typeof window !== 'undefined' && window.nodecg) {
      return window.nodecg;
    }
    return null;
  }
  
  export function useReplicant<T>(replicantName: string, defaultValue: T): [T, (value: T) => void] {
    const [value, setValue] = React.useState<T>(defaultValue);
  
    React.useEffect(() => {
      const nodecg = getNodeCG();
      if (!nodecg) return;
  
      const replicant = nodecg.Replicant(replicantName, { defaultValue });
  
      const changeHandler = (newValue: T) => {
        setValue(newValue);
      };
  
      replicant.on('change', changeHandler);
  
      return () => {
        replicant.removeListener('change', changeHandler);
      };
    }, [replicantName, defaultValue]);
  
    const updateReplicant = (newValue: T) => {
      const nodecg = getNodeCG();
      if (!nodecg) return;
  
      const replicant = nodecg.Replicant(replicantName);
      replicant.value = newValue;
    };
  
    return [value, updateReplicant];
  }
  
  