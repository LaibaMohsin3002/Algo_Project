'use client'
import styles from './mainpage.module.css'
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
    <div className={styles.body}>
      <Container maxWidth="sm" sx={{ mt: 5 }} className={styles.container}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom className={styles.heading}>
            Algorithm Selector
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }} className={styles.formControl}>
            <InputLabel id="algo-select-label" className={styles.inputLabel}>
              Choose Algorithm
            </InputLabel>
            <Select
              labelId="algo-select-label"
              color="white"
              value={selectedAlgo}
              onChange={handleAlgorithmChange}
              label="Choose Algorithm"
              className={styles.select}
              IconComponent={() => <div className={styles.selectIcon}></div>}
            >
              <MenuItem value="closest-pair" className={styles.menuItem}>Closest Pair Algorithm</MenuItem>
              <MenuItem value="integer-multiplication" className={styles.menuItem}>Integer Multiplication Algorithm</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedAlgo}
            onClick={navigateToAlgorithm}
            className={`${styles.button} ${!selectedAlgo ? styles.buttonDisabled : ''}`}
          >
            Go
          </Button>
        </Box>
      </Container>
    </div>
  );
};
