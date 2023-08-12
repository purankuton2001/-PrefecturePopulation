import {GetStaticProps} from "next";
import axios from "axios";
import { ChangeEventHandler, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Highcharts, {SeriesOptionsType, SeriesXrangeOptions, XrangePointOptionsObject} from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styles from  "../styles/index.module.css";

type fetchedPredfectureData = {
  prefCode: number;
  prefName: string;
}
type HomeProps = {
  data: {data: fetchedPredfectureData[], key: string};
}

export default function Home({data: d}: HomeProps) {
  const {data, key} = d;
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<number>(0);
  const [selectedPref, setSelectedPref] = useState<number[]>([]);
  const [options, setOptions] = useState<Highcharts.Options>({
    title: {
      text: '都道府県別総人口'
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointInterval: 5,
        pointStart: 1965
      }
    },
    series: [],
  });

  const onChangePrefecture: ChangeEventHandler<HTMLInputElement> = async (ev) => {
    setLoading(true);
    const targetValue = ev.target.value.split(",");
    //チェックボックスがオンにされた場合、オンにされた都道府県のデータをoptionステイトに追加する
    if(ev.target.checked){
      setSelectedPref([...selectedPref, Number(targetValue[0])]);
      const newSeries: SeriesOptionsType[] = options.series as SeriesOptionsType[];
      const newData: XrangePointOptionsObject[] = [];
      const res = await axios.get(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear`, {
          params: {prefCode: targetValue[0], cityCode: "-"},
          headers: {'X-API-KEY': key}
        });
      res.data.result.data[mode].data.forEach((targetData: any) => {
        newData.push(targetData.value)
      });
      newSeries.push(
        {name: targetValue[1],
          data: newData,
        } as SeriesOptionsType
      );
      setOptions({... options, series: newSeries});
    }
    //オフにされた場合オフにされた都道府県のデータを削除する
    else{
      setSelectedPref(selectedPref.filter(v => Number(targetValue[0]) !== v));
      setOptions({...options, series: options.series?.filter(value => value.name !== targetValue[1])});
    }
    setLoading(false);
  }

  const onChangeMode: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setMode(Number(event.target.value));
    const newSeries: SeriesOptionsType[] = [] as SeriesOptionsType[];
    setLoading(true);
    selectedPref.forEach(async (prefCode) => {
      const newData: XrangePointOptionsObject[] = [];
      const res = await axios.get(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear`, {
          params: {prefCode, cityCode: "-"},
          headers: {'X-API-KEY': key}
        });
      res.data.result.data[mode].data.forEach((targetData: any) => {
        newData.push(targetData.value)
      });
      newSeries.push(
        {name: data.filter(value => value.prefCode === prefCode)[0].prefName,
          data: newData,
        } as SeriesOptionsType
      );
    });
    setOptions({... options, series: newSeries});
    setLoading(false);
  }

  return (
    <div className={styles.container}>
      <h2　className={styles.title}>都道府県別総人口グラフ</h2>
      <div className={styles.checkbox}>
        {data.map((prefecture, index) => {
          return(
              <div className={styles.checkboxItem} key={index}>
                <input disabled={loading} type="checkbox" value={prefecture.prefCode + "," + prefecture.prefName} onChange={onChangePrefecture} id={prefecture.prefName}/>
                <label className={styles.checkboxText} htmlFor={prefecture.prefName}>{prefecture.prefName}</label>
              </div>
          )
        })}
      </div>
      <div className={styles.selectContainer}>
        <select className={styles.select} name="mode" onChange={onChangeMode}>
          <option value="0">総人口</option>
          <option value="1">年少人口</option>
          <option value="2">生産年齢人口</option>
          <option value="3">老年人口</option>
        </select>
      </div>
      <div className={styles.chart}>
        <HighchartsReact
            allowChartUpdate={true}
            highcharts={Highcharts}
            options={options}
        />
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  //返すデータを定義
  try{
    // 都道府県一覧を取得
    const data = await axios.get(
      `https://opendata.resas-portal.go.jp/api/v1/prefectures`, {
        headers: {'X-API-KEY': process.env.RESAS_API_KEY}
      });
    if (!data) {
      return {
        notFound: true
      };
    }
    return {
      props: {data: {data: data.data.result, key: process.env.RESAS_API_KEY}},
    };
  }
  catch (error){
    return {
      notFound: true
    }
  }
};

