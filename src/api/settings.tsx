export interface Pallate {
    primary: string
    secondary: string
    tertiary: string
    text: string
    background: string
    special: string
    blue: string
    blueHover: string
    red: string
    redHover: string
    green: string
    greenHover: string
    gray: {
        500: string
        400: string
        300: string
        200: string
        800: string
        100: string
        50: string
    }
    white: string
    black: string
    accent: string
    accentHover: string
}

export function DefaultPallate(): Pallate {
    return {
        primary: 'green-700',
        secondary: 'green-500',
        tertiary: 'emerald-800',
        text: 'black',
        background: 'emerald-100',
        special: 'teal-900',
        blue: 'blue-500',
        blueHover: 'blue-100',
        red: 'red-500',
        redHover: 'red-100',
        green: 'green-600',
        greenHover: 'green-100',
        gray: {
            500: 'gray-500',
            400: 'gray-400',
            300: 'gray-300',
            200: 'gray-200',
            800: 'gray-800',
            100: 'gray-100',
            50: 'gray-50'
        },
        white: 'white',
        black: 'black',
        accent: 'teal-600',
        accentHover: 'teal-100'
    }
}

export async function SetPallate(pallate: Pallate){
    
    return pallate;
}

export async function GetPallate() : Promise<Pallate> {
    return DefaultPallate();
}

