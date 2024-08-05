// src/queries.js
import { gql } from '@apollo/client';

export const GET_TOURNAMENTS = gql`
  query GetTournaments {
    tournaments {
      id
      name
    }
  }
`;
