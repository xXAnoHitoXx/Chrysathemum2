"use client"

import { useState } from "react";

export default function MigrationStation() {

    const [ prod_mode, set_prod_mode ] = useState(false);

    const on_click = () => {
        set_prod_mode(!prod_mode);
    }

    return(
        <div>
            <div className="flex flex-wrap w-full h-fit p-4 gap-2 justify-center">
                <button onClick={on_click} className="border-2 border-sky-400 rounded-full w-32 h-20">
                    { (prod_mode)? "Current Mode: Production" : "Current Mode: Development" }
                </button>
                <a href={ "/salon/migration/sequence/".concat( (prod_mode)? "production" : "development" ) }>
                    <button className="border-2 border-sky-400 rounded-full w-32 h-20">Initiate Migration Sequence</button>
                </a>
            </div>
        </div>
    );
}

