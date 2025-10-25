import { addMinutes } from "date-fns";

function roundToNearestSlot(
    date: Date,
    slotDuration: number,
): Date {
    const minutes = date.getMinutes();
    const remainder = minutes % slotDuration;
    if (remainder < slotDuration / 2) {
        return addMinutes(date, -remainder);
    } else {
        return addMinutes(date, slotDuration - remainder);
    }
}

export default roundToNearestSlot;

