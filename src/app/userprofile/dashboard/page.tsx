"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Suspense } from 'react'
import UserNav from "@/components/nav/userNav/nav";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
	collection,
	setDoc,
	doc,
	getDocs,
	query,
	where,
	CollectionReference,
	onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Firebase from "@/firebase/firebase";
import { Services } from "@/database/data";
import styles from "./styles.module.css";

type FormValue = {
	email: string;
	passCode0: string;
	passCodeV0: string;
	selectCategory: string;
	selectService: string;
	input: any;
	name: string;
	address: string;
	number: string;
	countrySelect: string;
	stateSelect: string;
	areaSelect: string;
	src: string;
	docid: string;
};

const { auth, storage, database } = Firebase;

export default function Profile() {
	const [profileDetails, setProfileDetails] = useState<FormValue | null>(null);

	const [imageUrl, setImageUrl] = useState("");

	const [tab, setTab] = useState("");
	const [userA, setUser] = useState<any>(auth);

	const router = useRouter();
	const user = auth.currentUser;

	const imageRef = ref(storage, `image/${user?.email}`);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUpload = () => {
		const fileInput = fileInputRef.current;
		if (fileInput && fileInput.files && fileInput.files.length > 0) {
			const file = fileInput.files[0]; // Get the first selected file

			// Reference to the root of the default Firebase Storage bucket
			

			// Upload the file
			uploadBytes(imageRef, file)
				.then((snapshot) => {
					getDownloadURL(imageRef).then((url)=>{
						setImageUrl(url);
					})
					
					console.log("Uploaded a file!");
				})
				.catch((error) => {
					console.error(error); // Handle any errors
				});
		}
	};

	const profileDetailRef = collection(
		database,
		`profile`
	);

	const userQuery = query(
		profileDetailRef,
		where("email", "==", `${user?.email}`)
		);


	const handleGetProfileDetail = async () => {

		try {
		
			const querySnapshot = await getDocs(userQuery);

			if (querySnapshot.empty) {
				console.log("No profile details found");
				return;
			}

			const retrievedData = querySnapshot.docs[0].data() as FormValue;
			setProfileDetails(retrievedData);
		} catch (error) {
			console.error("Error getting profile detail:", error);
		}
	};

	const categoryName = profileDetails?.selectCategory;
	const serviceName = profileDetails?.selectService;

	const Category = Services.find(
		(category) => category.category === `${categoryName}`
	);

	const Service = Category?.services.find(
		(service) => service.name === `${serviceName}`
	);

	const categoryImg = Category?.src;
	const serviceImg = Service?.src;

	
	const handleProfileDetail = async () => {
		try {
			const profileDetailRef = collection(
				database,
				`profile`,

			);
			await setDoc(doc(profileDetailRef, profileDetails?.docid), {
				src: imageUrl,
			},{merge: true});
			console.log("Profile detail added successfully");
		} catch (error) {
			console.error("Error adding profile detail:", error);
		}
	};
	useEffect(() => {
		handleProfileDetail();
	},[handleUpload]);
		
	
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				user.reload();

				getDownloadURL(imageRef).then(url =>{
					setImageUrl(url);
				})

				handleGetProfileDetail(); 
				
				// Update profile with image URL if user is signed in
				updateProfile(user, { photoURL: imageUrl })
					.then(() => {
						console.log('Profile picture updated successfully');
					})
					.catch((error) => {
						console.error('Error updating profile picture:', error);
					});
			} else {
			// Redirect to login page if not signed in
				router.push('/');
			}
		});
	
		// Cleanup function to avoid memory leaks
		return () => unsubscribe();
	}, []); // Re-run useEffect when imageUrl or auth changes



	

	return (
		<main className={styles.mainBodyCover}>
			<UserNav/>
			<div className={styles.mainBody}>
			<div className={styles.profilePictureFlexControl}>
				<div className={styles.profilePictureServiceCover}>
					<div className={styles.serviceImgCover}>
						<Image
							object-fit="cover"
							className={styles.serviceImg}
							alt="Picture of the author"
							quality={100}
							width={100}
							height={100}
							src={`${serviceImg}`}
							priority={true}
							unoptimized
						/>
					</div>
					<div className={styles.profilePictureBodyCover}>
						<div className={styles.profilePictureBodyFlexControl}>
							<div className={styles.profilePictureCover}>
								<div className={styles.profileName}>{user?.displayName}</div>
								{tab !== "update" && (
									<>
										<div className={styles.profileImgCover}>
											<Image
												object-fit="cover"
												className={styles.profileImg}
												alt="Picture of the author"
												quality={100}
												width={100}
												height={100}
												src={`${imageUrl}`}
												priority={true}
												unoptimized
											/>
										</div>
										<button className={styles.updateCover}>
											<span
												onClick={() =>
													tab === "update" ? setTab("") : setTab("update")
												}
												className={styles.clickToUpdate}
											>
												Update Profile picture
											</span>
										</button>
									</>
								)}

								{tab === "update" && (
									<div className={styles.formContainer}>
										<div className={styles.inputImageCover}>
											<input
												type="file"
												accept="image/*"
												className={styles.input}
												ref={fileInputRef}
												placeholder="Upload Display Picture"
											/>
										</div>
										<button onClick={handleUpload}>
											Upload
										</button>
										<button onClick={()=> setTab("")}>Back</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.profileBodyFlexControl}>
				<div className={styles.profileBodyCategoryCover}>
					
					<div className={styles.categoryImgCover}>
						<Image
							object-fit="cover"
							className={styles.categoryImg}
							alt="Picture of the author"
							quality={100}
							width={100}
							height={100}
							src={`${categoryImg}`}
							priority={true}
							unoptimized
						/>
					</div>
					<div className={styles.profileBodyCover}>
						<div className={styles.profileBodyFlexControl}>
							<div className={styles.profileInfoContainer}>
								<div className={styles.infoContainer}>
									<span className={styles.title}>Service Category {` : `}</span>
									<span className={styles.titleInfo}>
										{profileDetails?.selectCategory}
									</span>
								</div>
								<div className={styles.infoContainer}>
									<span className={styles.title}>Service {` : `}</span>
									<span className={styles.titleInfo}>
										{profileDetails?.selectService}
									</span>
								</div>
								<div className={styles.infoContainer}>
									<span className={styles.title}>Country {` : `}</span>
									<span className={styles.titleInfo}>
										{profileDetails?.countrySelect}
									</span>
								</div>
								<div className={styles.infoContainer}>
									<span className={styles.title}>State {` : `}</span>
									<span className={styles.titleInfo}>
										{profileDetails?.stateSelect}
									</span>
								</div>
								<div className={styles.infoContainer}>
									<span className={styles.title}>Area {` : `}</span>
									<span className={styles.titleInfo}>
										{profileDetails?.areaSelect}
									</span>
								</div>
								<div className={styles.infoContainer}>
									<span className={styles.title}>Address {` : `}</span>
									<span className={styles.titleInfo}>
										{profileDetails?.address}
									</span>
								</div>
								<div className={styles.infoContainer}>
									<span className={styles.title}>Contact {` : `}</span>
									<span className={styles.titleInfo}>
										{profileDetails?.number}
									</span>
								</div>
								<div className={styles.infoContainer}>
									<span className={styles.title}>Email {` :`}</span>
									<span className={styles.titleInfo}>
									{profileDetails?.email}
									</span>
								</div>
							</div>
						</div>
				
				</div>
				</div>
			</div>
			</div>
		</main>
	);
}
