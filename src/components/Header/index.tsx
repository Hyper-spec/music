import { format } from "date-fns"
import enUS from "date-fns/locale/en-US";
import ptBR from "date-fns/locale/pt-BR"
import styles from "../Header/styles.module.scss"
import Link from 'next/link'

export function Header() {
    const currentDate = format(new Date(), 'EEEEEE, d MMMM', {locale: enUS});
    console.log(currentDate)


    return (
        <header className={styles.headerContainer}>
            <Link href={'/'}><a>Sound+</a></Link>

            <p>Nothing but the moment</p>

            <span>{currentDate}</span>
        </header>
    );
}