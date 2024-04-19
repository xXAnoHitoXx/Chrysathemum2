function Salon(
    { params: { salon: salon_code }, } : { params: { salon: string }, }
) {
    console.log(salon_code);
    return(<div>Salon Page</div>);
}

export default Salon;
