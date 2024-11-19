'use client'
import './globals.css'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';

export default function Home() {
  const [selectedAlgo, setSelectedAlgo] = useState('');
  const router = useRouter();

  const handleAlgorithmChange = (event) => {
    setSelectedAlgo(event.target.value);
  };

  const navigateToAlgorithm = () => {
    if (selectedAlgo === 'closest-pair') {
      router.push(`/ClosestPairDC`);
    } else if (selectedAlgo === 'integer-multiplication') {
      window.location.href = '/IntegerMultiplication/index.html';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Algorithm Selector
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="algo-select-label">Choose Algorithm</InputLabel>
          <Select
            labelId="algo-select-label"
            colour = "white"
            value={selectedAlgo}
            onChange={handleAlgorithmChange}
            label="Choose Algorithm"
          >
            <MenuItem value="closest-pair">Closest Pair Algorithm</MenuItem>
            <MenuItem value="integer-multiplication">Integer Multiplication Algorithm</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedAlgo}
          onClick={navigateToAlgorithm}
        >
          Go
        </Button>
      </Box>
    </Container>
  );
};


