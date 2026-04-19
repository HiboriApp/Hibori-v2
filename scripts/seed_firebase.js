import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

// Use the project's firebase config (no admin/service account required)
const firebaseConfig = {
  apiKey: "AIzaSyA7oCGybecfh554ctxG5mGTYNZIDw5PrQg",
  authDomain: "hibori-complete.firebaseapp.com",
  projectId: "hibori-complete",
  storageBucket: "hibori-complete.firebasestorage.app",
  messagingSenderId: "962226487196",
  appId: "1:962226487196:web:77676f622a945c04fb1259",
  measurementId: "G-7T2BCH97TR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userCount = parseInt(process.env.SEED_USERS || process.argv[2] || '10', 10);
const postsPerUser = parseInt(process.env.SEED_POSTS_PER_USER || process.argv[3] || '3', 10);

const sampleNames = ['דניאל','נעה','איתי','מיה','יאיר','רותם','ליאן','עמית','שירה','אורי','ליאון','מיכל','גיא','נועה','תומר','רוני','אסף','אביב','יעל','נועם'];
const sampleBios = ['מפתח תוכנה','אוהב קפה','חובב טיולים','מעצב מוצר','מפתח מובייל','חובב קוד פתוח','אדם וחתול','אוהב כלבים','Front-end Developer','Back-end Developer','מוזיקה וטכנולוגיה'];
const samplePostContents = ['שלום עולם','יום נהדר היום','עובד על פרויקט חדש','תראו את התמונה הזו!','מה דעתכם על זה?','זכור מהקיץ האחרון','חושב על דברים','עדכון אקראי'];

function randomFrom(arr){return arr[Math.floor(Math.random() * arr.length)];}
function randHex(){return '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');}

async function createSeededUsersAndPosts(){
  const createdUsers = [];
  for (let i = 0; i < userCount; i++){
    const name = randomFrom(sampleNames) + ' ' + (i+1);
    const email = `seed+${i+1}@example.com`;
    const uid = `seed-${Date.now().toString().slice(-6)}-${i+1}`;
    try {
      const userDoc = {
        id: uid,
        name,
        pallate: {
          primary: randHex(),
          secondary: randHex(),
          tertiary: randHex(),
          text: '#000000',
          background: '#FFFFFF',
          main: '#FFFFFF'
        },
        icon: {
          type: 'image',
          content: 'https://ui-avatars.com/api/?name='+encodeURIComponent(name)
        },
        lastSeen: new Date().toString(),
        bio: randomFrom(sampleBios),
        email,
        notifications: [],
        likes: [],
        friends: [],
        lastOnline: Timestamp.now(),
        wantsNotifications: true,
        background: null
      };

      await setDoc(doc(db, 'users', uid), userDoc);
      createdUsers.push(uid);

      for (let p = 0; p < postsPerUser; p++){
        const postId = `${uid}-post-${p+1}-${Date.now().toString().slice(-6)}`;
        const post = {
          id: postId,
          content: randomFrom(samplePostContents),
          timestamp: Timestamp.now(),
          likes: Math.floor(Math.random()*100),
          comments: [],
          owner: uid
        };
        await setDoc(doc(db, 'posts', postId), post);
      }

      console.log(`Created user ${uid} (${email}) with ${postsPerUser} posts.`);
    } catch (err){
      console.error('Error creating user or posts:', err);
    }
  }
  console.log(`Done. Created ${createdUsers.length} users.`);
  process.exit(0);
}

createSeededUsersAndPosts();
