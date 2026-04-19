import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteSeedsFromCollection(collectionName) {
	const snapshot = await getDocs(collection(db, collectionName));
	let deleted = 0;
	for (const d of snapshot.docs) {
		const id = d.id;
		if (typeof id === 'string' && id.startsWith('seed')) {
			try {
				await deleteDoc(doc(db, collectionName, id));
				console.log(`Deleted ${collectionName}/${id}`);
				deleted++;
			} catch (err) {
				console.error(`Failed to delete ${collectionName}/${id}:`, err);
			}
		}
	}
	return deleted;
}

async function main() {
	console.log('Starting removal of seeded documents...');  
	const usersDeleted = await deleteSeedsFromCollection('users');
	const postsDeleted = await deleteSeedsFromCollection('posts');
	console.log(`Done. Deleted ${usersDeleted} users and ${postsDeleted} posts.`);
	process.exit(0);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });

