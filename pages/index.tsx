import styles from '../styles/Home.module.css'
import {GetStaticProps} from "next";
import axios from "axios";
import {ChangeEventHandler, useEffect, useState} from "react";

type HomeProps = {
  data: {
    message: string | null,
    result: {prefCode: number, prefName: string}[]
  };
  notFound?: boolean;
}
type TargetData = {
  year: number,
  value: number
}
type GraphData = {
  year: number,
  [code: string]: number,
}

export default function Home({data, notFound}: HomeProps) {
  useEffect(() => {
    if(notFound){
      alert("APIからのデータ取得に失敗しました")
    }
  }, []);
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const onChangePrefecture: ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const targetValue = ev.target.value.split(",")
    const newGraphData = graphData;
    if(ev.target.checked){
      const res = await axios.get(
          `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear`, {
            params: {prefCode: targetValue[0], cityCode: "-"},
            headers: {'X-API-KEY': 'P4SjAyQ6DjjKZxGxZqcyFwBDdml5uQMyR31twL8M'}
          });
      res.data.result.data[0].data.forEach((targetData: TargetData) => {
        const targetIndex = newGraphData.findIndex(d => d.year === targetData.year);
        if(targetIndex == -1){
          const newObject: GraphData = {year: targetData.year};
          newObject[targetValue[1]] = targetData.value;
          newGraphData.push(newObject);
        }else{
          newGraphData[targetIndex][targetValue[1]] = targetData.value;
        }
      });
    }
    else{
      newGraphData.forEach((graphData) => {
        delete graphData[targetValue[1]]
      })
    }
    newGraphData.sort((a, b) => a.year-b.year)
    setGraphData(newGraphData);
  }

  return (
    <div className={styles.container}>
      {data.result.map((prefecture) => {
        return(
            <div>
              <input type="checkbox" value={prefecture.prefCode + "," + prefecture.prefName} onChange={onChangePrefecture}/>
              <div>{prefecture.prefName}</div>
            </div>
        )
      })}
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
      props: {data: {}, notFound: true}
    };
  }

  return {
    props: {data},
  };
};

