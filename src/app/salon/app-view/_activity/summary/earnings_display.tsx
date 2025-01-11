function Row(props: {
    on_click: () => void;
    color: string;
    data: { text: string; width: string }[];
}) {
    return (
        <button
            onClick={props.on_click}
            className={
                "flex h-10 w-fit border-b-2 border-r-4 border-t-2" +
                " " +
                props.color
            }
        >
            {props.data.map((data) => (
                <div className={data.width + " " + "h-10"}>{data.text}</div>
            ))}
        </button>
    );
}
