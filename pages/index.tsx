import styles from '../styles/Home.module.css'
import {GetStaticProps} from "next";
import axios from "axios";
import {ChangeEventHandler, useEffect, useRef, useState} from "react";
import Highcharts, {SeriesOptionsType, SeriesXrangeOptions, XrangePointOptionsObject} from "highcharts";
import HighchartsReact from "highcharts-react-official";

type HomeProps = {
  data: {
    message: string | null,
    result: {prefCode: number, prefName: string}[]
  };
  notFound?: boolean;
}

export default function Home({data, notFound}: HomeProps) {
  useEffect(() => {
    if(notFound){
      alert("APIからのデータ取得に失敗しました")
    }
  }, []);
  const [test, setTest] = useState(0);
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
  const chartRef = useRef();

  const onChangePrefecture: ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const targetValue = ev.target.value.split(",");
    let newSeries: SeriesOptionsType[] = options.series;
    if(ev.target.checked){
      const res = await axios.get(
          `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear`, {
            params: {prefCode: targetValue[0], cityCode: "-"},
            headers: {'X-API-KEY': 'P4SjAyQ6DjjKZxGxZqcyFwBDdml5uQMyR31twL8M'}
          });
      const newData: XrangePointOptionsObject[] = [];
      res.data.result.data[0].data.forEach((targetData: any) => {
        newData.push(targetData.value)
      });
      newSeries.push(
          {name: targetValue[1],
            data: newData,
          }
      );
    }
    else{
       newSeries = options.series?.filter(value => value.name !== targetValue[1])
    }
    setOptions({...options, series: newSeries});
    // setTest(test+1);
    // chartRef.current.chart.redraw();
    // chartRef.current.chart.destroy();
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
      <HighchartsReact
          allowChartUpdate={true}
          ref={chartRef}
          highcharts={Highcharts}
          options={options}
      />
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

