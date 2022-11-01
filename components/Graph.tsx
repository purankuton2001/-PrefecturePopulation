import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import React, {useEffect} from "react";

type GraphProps = {
    options: Highcharts.Options
}
export const Graph: React.FC<GraphProps> = ({options}) => {
    useEffect(() => {
        console.log(options)
    }, [options])
    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={{...options}}
            />
        </div>
    )
}