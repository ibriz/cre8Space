import React, { useState, useEffect } from "react";
import CopyToClipboard from "./CopyToClipboard";
import { get_total_accrued_points } from "../services/AccumulatedPoints";
import { getOwnersList } from "../apis/api";

interface Leader {
  address: string;
  points: number;
  rank?: number;
}

const LeaderBoard: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ownersList, setOwnersList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getListOfOwners = async () => {
      try {
        const response = await getOwnersList();
        console.log(response, "res");
        setOwnersList(response);
      } catch (err) {
        console.error("Error fetching owners list:", err);
        setError("Failed to fetch owners list");
      }
    };
    getListOfOwners();
  }, []);

  useEffect(() => {
    const fetchLeaderData = async () => {
      if (ownersList.length === 0) return;

      setIsLoading(true);
      try {
        const leaderPromises = ownersList.map(async (address) => {
          const points = await get_total_accrued_points(address);
          console.log({ address, points });
          return { address, points: Number(points) };
        });

        const leaderResults = await Promise.all(leaderPromises);
        console.log(leaderResults, "new leaders");

        // Sort leaders by points in descending order and add rank
        const sortedLeaders = leaderResults
          .sort((a, b) => b.points - a.points)
          .map((leader, index) => ({ ...leader, rank: index + 1 }));

        setLeaders(sortedLeaders);
      } catch (err) {
        console.error("Error fetching leader data:", err);
        setError("Failed to fetch leader data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderData();
  }, [ownersList]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div className="pl-16">Loading leaderboard...</div>;
  }

  return (
    <div>
      <h4 className="my-2 text-center text-2xl font-semibold text-primary">
        Leaderboard
      </h4>
      <table className="table-auto border-separate border-spacing-y-1">
        <thead className="bg-gray-100 text-center text-primary">
          <tr className="font-normal">
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">Wallet Address</th>
            <th className="px-4 py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader) => (
            <tr
              key={leader.address}
              className="rounded-lg bg-gray-100 text-center shadow-sm"
            >
              <td className="px-1 py-2">{leader.rank}</td>
              <td className="flex items-center gap-2 px-4 py-2">
                {leader.address.slice(0, 4)}...
                {leader.address.slice(-3)}
                <CopyToClipboard textToCopy={leader.address} />
              </td>
              <td className="px-4 py-2">{leader.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderBoard;
