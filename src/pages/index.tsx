import {GetStaticProps} from 'next'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import Head from 'next/head'
import ptBR from 'date-fns/locale/pt-BR'
import Image from 'next/image';
import {api} from "../services/api"
import { stringify } from 'node:querystring'
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString'

import styles from './styles/home.module.scss';
import { PlayerContext, usePlayer } from '../contexts/PlayerContext';

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
  //ou episodes: Array<Episode>
} 

export default function Home({latestEpisodes, allEpisodes}: HomeProps) {
  const {playList} = usePlayer()
  const episodeList = [...latestEpisodes, ...allEpisodes];


  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Recomended by Sound+</h2>
        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image width={192} height={192} objectFit='cover' src={episode.thumbnail} alt={episode.title}/>

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                </div>

                <button type='button' onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      
      <section className={styles.allEpisodes}>
        <h2>All Songs</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Song</th>
              <th>Artist</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id} style={{width: 72}}>
                  <td>
                    <Image width={600} height={600} src={episode.thumbnail} alt={episode.title}/>
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>
                    {episode.members}
                  </td>
                  <td>
                    {episode.durationAsString}
                  </td>
                  <td>
                    <button type='button' onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="./play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const {data} = await api.get('episodes', {
    params: {
      _limit: 12,
      _order: 'desc',
      _sort: 'published_at'
    }
  });

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length)


  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }

  
}

