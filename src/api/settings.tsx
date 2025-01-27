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
    primary: '#3b82f6',
    secondary: '#f3f4f6',
    tertiary: '#f1f5f9',
    text: '#F3F6FFFF',
    background: '#0D1620FF',
    main: '#0D1620FF',
  }
}

  

export async function SetPallate(pallate: Pallate){
    
    return pallate;
}

export async function GetPallate(user: UserData) : Promise<Pallate> {
    return user.pallate;
}

