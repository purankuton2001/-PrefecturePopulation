import styles from '../styles/Home.module.css'
import {GetStaticProps} from "next";
import axios from "axios";
import {useEffect} from "react";

type HomeProps = {
  data?: object;
  notFound?: boolean;
}

export default function Home({data, notFound}: HomeProps) {
  useEffect(() => {
    if(notFound){
      alert("APIからのデータ取得に失敗しました")
    }
  }, []);

  return (
    <div className={styles.container}>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get(
      `https://opendata.resas-portal.go.jp/api/v1/prefectures`, {
        headers: {'X-API-KEY': 'P4SjAyQ6DjjKZxGxZqcyFwBDdml5uQMyR31twL8M'}
      });
  const data = res.data;

  if (!data) {
    return {
      props: {notFound: true}
    };
  }

  return {
    props: {data},
  };
};

