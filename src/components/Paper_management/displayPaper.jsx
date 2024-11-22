import React, { useEffect, useState } from "react";
// import { db } from "../firebaseConfig";
// import { collection, getDocs } from "firebase/firestore";

const DisplayPaper = () => {
  const [papers, setPapers] = useState([]);

  const fetchPapers = async () => {
    try {
      const papersCollection = collection(db, "papers");
      const snapshot = await getDocs(papersCollection);
      const papersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(papersData);
    } catch (error) {
      console.error("Error fetching papers: ", error);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  return (
    <div>
      <h2>Papers Available</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Paper Name</th>
            <th>Company</th>
            <th>GSM</th>
            <th>Price/Sheet</th>
            <th>Length</th>
            <th>Breadth</th>
            <th>Freight/KG</th>
            <th>Rate/Gram</th>
            <th>Area</th>
            <th>1 Sqcm in Gram</th>
            <th>GSM/Sheet</th>
            <th>Freight/Sheet</th>
            <th>Final Rate</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper.id}>
              <td>{new Date(paper.timestamp?.seconds * 1000).toLocaleDateString()}</td>
              <td>{paper.paperName}</td>
              <td>{paper.company}</td>
              <td>{paper.gsm}</td>
              <td>{paper.pricePerSheet}</td>
              <td>{paper.length}</td>
              <td>{paper.breadth}</td>
              <td>{paper.freightPerKg}</td>
              <td>{paper.ratePerGram}</td>
              <td>{paper.area}</td>
              <td>{paper.oneSqcmInGram}</td>
              <td>{paper.gsmPerSheet}</td>
              <td>{paper.freightPerSheet}</td>
              <td>{paper.finalRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisplayPaper;
