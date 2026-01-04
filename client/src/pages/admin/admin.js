import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Box, Typography } from "@mui/material";
import { gameAPI } from "@/services/api";
import { AdminGameTable, AdminSidebar } from "@/components/common/adminComponents";
import { Loader, Toast, Button } from "@/components/common/uiComponents";
import Layout from "@/components/common/layoutComponent";

export default function AdminPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPendingGames();
  }, [page]);

  const fetchPendingGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.listPendingGames({
        page,
        limit: 10,
      });
      setGames(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to fetch pending games");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gameId) => {
    try {
      await gameAPI.approveGame(gameId);
      fetchPendingGames();
    } catch (err) {
      setError(err.message || "Failed to approve game");
      setShowToast(true);
    }
  };

  const handleReject = async (gameId) => {
    if (!confirm("Are you sure you want to reject (delete) this game?")) {
      return;
    }
    try {
      await gameAPI.deleteGame(gameId);
      fetchPendingGames();
    } catch (err) {
      setError(err.message || "Failed to reject game");
      setShowToast(true);
    }
  };

  if (loading && games.length === 0) {
    return (
      <Layout>
        <Loader fullscreen />
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel | CyberArena</title>
      </Head>
      <Layout>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <AdminSidebar />
          <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
            <Typography
              variant="h4"
              className="gaming-title"
              sx={{
                fontFamily: "'Jersey 10', sans-serif",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "2px",
                mb: 4,
              }}
            >
              Pending Game Approvals
            </Typography>

            {games.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography variant="h6" sx={{ color: "text.secondary" }}>
                  No pending games to approve
                </Typography>
              </Box>
            ) : (
              <>
                <AdminGameTable
                  games={games}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 4 }}>
                    <Button
                      label="Previous"
                      variant="secondary"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    />
                    <Typography sx={{ px: 2 }}>
                      Page {page} of {totalPages}
                    </Typography>
                    <Button
                      label="Next"
                      variant="secondary"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    />
                  </Box>
                )}
              </>
            )}

            {showToast && error && (
              <Toast
                message={error}
                type="error"
                onClose={() => setShowToast(false)}
              />
            )}
          </Container>
        </Box>
      </Layout>
    </>
  );
}

