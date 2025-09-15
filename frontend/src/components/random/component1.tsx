'use client';
import {useState} from "react";

type direction = "plus" | "minus";

const ClassicComponent = () => {
    const [count, setCount] = useState(0)

    const changeCount = (direction:direction) => {
        if (direction == "plus") {
            setCount(count + 1);
        }
        if (direction == "minus") {
            setCount(count - 1);
        }
    }

    return (
        <div>
            <h1>{count}</h1>
            <button onClick={() => changeCount("plus")}>plus</button>
            <button onClick={() => changeCount("minus")}>minus</button>
        </div>
    )
}

export default ClassicComponent;