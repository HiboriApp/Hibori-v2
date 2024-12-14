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
      primary: '#15803d',
      secondary: '#22c55e',
      tertiary: '#065f46',
      text: '#FFFFFFFF',
      background: '#000000FF',
      special: '#134e4a',
      blue: '#3b82f6',
      blueHover: '#dbeafe',
      red: '#ef4444',
      redHover: '#fee2e2',
      green: '#16a34a',
      greenHover: '#dcfce7',
      gray: {
        500: '#6b7280',
        400: '#9ca3af',
        300: '#d1d5db',
        200: '#e5e7eb',
        800: '#1f2937',
        100: '#f3f4f6',
        50: '#f9fafb'
      },
      white: '#ffffff',
      black: '#000000',
      accent: '#0d9488',
      accentHover: '#ccfbf1'
    }
  }
  
  

export async function SetPallate(pallate: Pallate){
    
    return pallate;
}

export async function GetPallate() : Promise<Pallate> {
    return DefaultPallate();
}

