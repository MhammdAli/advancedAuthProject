

export function toSecond(totalSeconds : number) : number{
   return Math.floor(totalSeconds % 60)
}

export function toMinutes(totalSeconds : number) : number{
    return Math.floor((totalSeconds % 3600) / 60)
}

export function toHours(totalSeconds : number) : number{
    return Math.floor((totalSeconds % (3600 * 24)) / 3600);
}

 export function toDays(totalSeconds : number) : number{
    return  Math.floor(totalSeconds / (3600 * 24));
 }
export function toDaysMinutesSeconds(totalSeconds : number): string{
    const seconds = toSecond(totalSeconds)
    const minutes = toMinutes(totalSeconds);
    const hours = toHours(totalSeconds);
    const days = toDays(totalSeconds);
  
    const secondsStr = makeHumanReadable(seconds, 'second');
    const minutesStr = makeHumanReadable(minutes, 'minute');
    const hoursStr = makeHumanReadable(hours, 'hour');
    const daysStr = makeHumanReadable(days, 'day');
  
    return `${daysStr}${hoursStr}${minutesStr}${secondsStr}`.replace(/,\s*$/, '');
}
  
function makeHumanReadable(num : number , singular : string) : string{
return num > 0
    ? num + (num === 1 ? ` ${singular}, ` : ` ${singular}s, `)
    : '';
}