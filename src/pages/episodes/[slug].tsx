import { parseISO } from 'date-fns'
import format from 'date-fns/format'
import { ptBR } from 'date-fns/locale'
import { GetStaticPaths, GetStaticProps } from 'next'

import Link from 'next/link'
import Image from 'next/image'
import {useRouter} from 'next/router'
import { api } from '../../services/api'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'
import styles from './episode.module.scss'
import { usePlayer } from '../../contexts/PlayerContext'
import Head from 'next/head'

type Episode = {
    id: string;
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    durationAsString: string;
    url: string;
    publishedAt: string;
    description: string;
}

type EpisodeProps = {
    episode: Episode;
}



export default function episode({episode}: EpisodeProps) {
    const {play} = usePlayer();

    return (
        <div className={styles.episode}>
            <Head>Artist</Head>
            <div className={styles.thumbnailContainer}>
                <Link href={'/'}>
                    <button type='button'>
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image width={1000} height={340} objectFit={'cover'} src={episode.thumbnail} />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>By {episode.members}</span>
                <span>{episode.durationAsString}</span>
            </header>


            <div className={styles.name}>Who is {episode.members}</div>
            <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}} />
        </div>
    )
}


export const getStaticPaths: GetStaticPaths = async() => {
    const {data} = await api.get('episodes', {
        params: {
          _limit: 12,
          _order: 'desc',
          _sort: 'published_at'
        }
    });

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })


    return {
        paths,
        fallback: 'blocking'
    }
}


export const getStaticProps: GetStaticProps = async(ctx) => {
    const {slug} = ctx.params
    
    const {data} = await api.get(`/episodes/${slug}`)


    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        url: data.file.url,
        description: data.description
    }


    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24

    }
}