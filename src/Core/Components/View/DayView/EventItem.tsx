import { TZDate } from "@date-fns/tz";
import { useDraggable } from "@dnd-kit/core";
import { setHours, startOfDay, endOfDay, addMinutes, isAfter, differenceInMinutes, addDays, subDays } from "date-fns";
import { Resizable } from "re-resizable";
import { useMemo, useState, useEffect } from "react";
import { BaseEventProps } from "../../../../types";
import { config } from "../../../../Utils/config";
import { ensureDate } from "../../../../Utils/DateTrannforms";
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
