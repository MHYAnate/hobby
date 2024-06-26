'use client'
import styles from "./styles.module.css";
import Logo from "./logo";
import Register from "./signUp";
import LogIn from "./logIn";
import About from "./about";
import Search from "./search";
import { Vendors } from "@/database/serviceData";
import { MenuTab } from "./menuTab";
import Market from "./marketing";
import Vacancy from "./vacancy";


export default function Nav() {

	return (
		<div className={styles.navBodyCover}>
      <div className={styles.navBody}>
		    <div className={styles.logo}><Logo/></div>
        <div className={styles.search}><Search suggestionsList={Vendors}/></div>
        <div className={styles.links}>
          <Vacancy />
          <Market />
          <About/>
          <LogIn/>
          <Register/>
        </div>
        <div className={styles.menu}><MenuTab/></div>
      </div>
		</div>
	);
}
