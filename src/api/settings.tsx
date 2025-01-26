export interface Pallate {
    primary: string
    secondary: string
    tertiary: string
    background: string
    text: string
  }
  
  export function DefaultPallate(): Pallate {
    return {
      primary: '#3b82f6',
      secondary: '#f3f4f6',
      tertiary: '#f1f5f9',
      text: '#111827',
      background: '#f1f5f9',
    }
  }
  
  

export async function SetPallate(pallate: Pallate){
    
    return pallate;
}

export async function GetPallate() : Promise<Pallate> {
    return DefaultPallate();
}

