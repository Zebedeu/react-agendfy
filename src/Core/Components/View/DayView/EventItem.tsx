import { BaseEventProps } from "../../../../types";
import BaseEvent from "../../BaseEvent";

export const EventItem: React.FC<BaseEventProps> = (props) => {
  return <BaseEvent {...props} />;
};
