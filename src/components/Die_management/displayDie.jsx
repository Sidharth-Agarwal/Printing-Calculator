import React, { useEffect, useState } from "react";
// import { db } from "../firebaseConfig";
// import { collection, getDocs } from "firebase/firestore";

const DieTable = () => {
  const [dies, setDies] = useState([]);

  const fetchDies = async () => {
    try {
      const diesCollection = collection(db, "dies");
      const snapshot = await getDocs(diesCollection);
      const diesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDies(diesData);
    } catch (error) {
      console.error("Error fetching dies: ", error);
    }
  };

  useEffect(() => {
    fetchDies();
  }, []);

  return (
    <div>
      <h2>Dies Available</h2>
      <table>
        <thead>
          <tr>
            <th>Job Type</th>
            <th>Type</th>
            <th>Product L</th>
            <th>Product B</th>
            <th>Die L</th>
            <th>Die B</th>
            <th>Paper L</th>
            <th>Paper B</th>
            <th>Frags</th>
            <th>Plate L</th>
            <th>Plate B</th>
            <th>CLSD L</th>
            <th>CLSD B</th>
            <th>Die Code</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {dies.map((die) => (
            <tr key={die.id}>
              <td>{die.jobType}</td>
              <td>{die.type}</td>
              <td>{die.productSizeL}</td>
              <td>{die.productSizeB}</td>
              <td>{die.dieSizeL}</td>
              <td>{die.dieSizeB}</td>
              <td>{die.paperSizeL}</td>
              <td>{die.paperSizeB}</td>
              <td>{die.frags}</td>
              <td>{die.plateSizeL}</td>
              <td>{die.plateSizeB}</td>
              <td>{die.clsdPrintSizeL}</td>
              <td>{die.clsdPrintSizeB}</td>
              <td>{die.dieCode}</td>
              <td>
                {die.imageUrl ? (
                  <img src={die.imageUrl} alt="Die" width="50" />
                ) : (
                  "No Image"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DieTable;