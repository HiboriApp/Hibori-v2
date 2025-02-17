import { UserData } from "./db"

export interface Pallate {
  primary: string
  secondary: string
  tertiary: string
  background: string
  text: string
  main: string
}

export function DefaultPallate(): Pallate {
  return {
    primary: '#4caf50',
    secondary: '#f5f5f5',
    tertiary: '#66bb6a',
    text: '#000000',
    background: '#FFFFFF',
    main: '#FFFFFF',
  }
}

  

export async function SetPallate(pallate: Pallate){
    
    return pallate;
}

export function GetPallate(user: UserData) : Pallate {
    return user.pallate || DefaultPallate();
}

