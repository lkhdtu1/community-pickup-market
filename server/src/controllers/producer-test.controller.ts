import { Request, Response } from 'express';

// Simple test functions
export const getProducerInformation = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Test getProducerInformation function' });
};

export const updateProducerInformation = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Test updateProducerInformation function' });
};
