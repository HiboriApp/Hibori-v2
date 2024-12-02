


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
        primary: 'green-700',
        secondary: 'green-500',
        tertiary: 'emerald-800',
        text: 'white',
        background: 'emerald-100',
        special: 'teal-900'
    }
}

export async function SetPallate(pallate: Pallate){
    
    return pallate;
}

export async function GetPallate() : Promise<Pallate> {
    return DefaultPallate();
}

