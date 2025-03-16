import { Resizable } from "re-resizable";
import { BaseEventProps } from "../../../../types";
import BaseEvent from "../../BaseEvent";

export const EventItem: React.FC<BaseEventProps> = (props) => {


    return (
      <Resizable
     
      >
     <BaseEvent
        {... props}
     
     />
     </Resizable>
      )
};
