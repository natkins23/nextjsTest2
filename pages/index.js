import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Note from '../components/Note'

export default function Home() {
    return (
        <div>
            <Head>
                <title>My Next.js App</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>
            <Note />
        </div>
    )
}
