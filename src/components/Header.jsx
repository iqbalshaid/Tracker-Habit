import styles from '../css/Header.module.css';

// router
import { Link } from 'react-router-dom';

// components
import IconButton from './Actions/IconButton';

// icons
import { FaPlus, FaBars, FaAward } from 'react-icons/fa';
import { MdLibraryBooks } from 'react-icons/md';
import Button from './Button';
import { useAuth } from '../Context/Auth-context';

const publicUrl = process.env.PUBLIC_URL;

function Header() {
const {logout} = useAuth();
	const navItems = [
		['/modal/habitEditor', 'Create new habit', <FaPlus />],
		['/modal/diary', 'Main Diary', <MdLibraryBooks />],
		['/modal/achievements', 'Achievements', <FaAward />],
		['/modal/menu', 'Menu', <FaBars />]
		
	].map(
		([path, title, icon]) => (
			<li key={path}>
				<Link to={publicUrl + path} state={{ modalTitle: title }}>
					<IconButton {...{ icon, title }} />
				</Link>
			</li>
		)
	);

	return (
		<header className={styles.header}>
			<div className={styles.logoWrapper}>
				<span className={styles.logo} />
				<h1>HabitTracker</h1>
			</div>

			<nav>
				<ul className={styles.navList}>
					{navItems}
				</ul>
				
			</nav>
	      <div style={{fontSize:"20px",fontWeight:"bold",padding:"10px 10px",borderRadius:"20px",backgroundColor:"red",color:"white",cursor:"pointer"}} onClick={logout}>SignOut</div>
		  
		</header>
	);
}

export default Header;