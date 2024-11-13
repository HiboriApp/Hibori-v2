


export interface Pallate{
    primary: string
    secondary: string
    tertiary: string
    text: string
    background: string
    special: string
}

export function DefaultPallate() : Pallate{
    return {
        primary: 'emerald-700',
        secondary: 'emerald-500',
        tertiary: 'emerald-800',
        text: 'white',
        background: 'emerald-900',
        special: 'emerald-300'
    }
}

export async function SetPallate(pallate: Pallate){
    return pallate;
}

export async function GetPallate() : Promise<Pallate> {
    return DefaultPallate();
}