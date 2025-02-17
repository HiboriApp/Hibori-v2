import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import { UserData } from './db';
import { uploadString } from './cloudinary';

export enum IconType{
    svg = "svg",
    image = "image"
}

export interface Icon{
    type: IconType,
    content: string,
}

export function notificationIcon(notification: 'message' | 'like' | 'comment', user: UserData) : Icon{
    switch (notification){
        case 'like': {
            return {type: IconType.image, content: 'https://uxwing.com/wp-content/themes/uxwing/download/relationship-love/red-heart-icon.png'};
        }
        case 'comment': {
            return user.icon;
        }
        case 'message': {
            return user.icon;
        }
    }
}

export async function GenerateIcons(seed: string) : Promise<Icon> {
    return {type: IconType.image, content: await createAvatar(lorelei, { seed: seed }).toString()};
}

export function Avatar({icon, className, isOnline} : {icon: Icon, className?: string, isOnline?: boolean}){
    if (isOnline == false || isOnline){
        if (icon.type === IconType.svg){
            return <div className="relative">
            <div className={className} dangerouslySetInnerHTML={{ __html: icon.content }} />
            <div className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          </div>;
        }
        else {
            return <div className="relative">
            <img alt='icon' className={className} src={icon.content} />
            <div className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          </div>;
        }
    }
    if (icon.type === IconType.image){return <img src={icon.content} alt="icon" className={className} />;} 
    else {return <div dangerouslySetInnerHTML={{ __html: icon.content }} className={className} />}
}

export function unknownIcon() : Icon{
    return {
        type: IconType.image,
        content: "https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/question-mark-round-icon.png"
    };
}