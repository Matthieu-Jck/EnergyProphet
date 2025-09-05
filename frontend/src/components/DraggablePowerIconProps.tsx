import { Dispatch, SetStateAction } from "react";

export interface DraggablePowerIconProps {
  icon: {
    id: number;
    used: boolean;
  };
  index: number;
  iconRefs: React.MutableRefObject<(HTMLImageElement | null)[]>;
  techRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
  setAdded: Dispatch<SetStateAction<{ [key: string]: number }>>;
  setIcons: Dispatch<
    SetStateAction<{ id: number; used: boolean }[]>
  >;
  setCurrentDragIndex: Dispatch<SetStateAction<number>>;
  unitAddition: number;
}