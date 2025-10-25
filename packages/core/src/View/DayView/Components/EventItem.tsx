import { Resizable } from "re-resizable";
import { BaseEventProps } from "../../../types";
import BaseEvent from "../../../Components/BaseEvent";
import { memo } from "react";

export const EventItemComponent: React.FC<BaseEventProps> = (props) => {
  return (
    <Resizable>
      <BaseEvent {...props} />
    </Resizable>
  );
};

export const EventItem = memo(EventItemComponent);
