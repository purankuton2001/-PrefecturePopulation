import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../pages';
import { fetchedPrefectureData } from '../pages';
import {RESAS_API_KEY } from '../apikey'





describe('Home Component', () => {
  const mockData = {
    data: [
      { prefCode: 13, prefName: "東京都" },
      { prefCode: 27, prefName: "大阪府" },
    ] as fetchedPrefectureData[],
    key: RESAS_API_KEY,
  };
  it('should renders checkboxes and mode selector', () => {
    render(<Home data={mockData} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const modeSelector = screen.getByRole('combobox');

    expect(checkboxes).toHaveLength(2);
    expect(modeSelector).toHaveLength(4);
  });
  it('user handles combobox', async () => {
    render(<Home data={mockData} />);

    const combobox = screen.getByRole('combobox');
    fireEvent.select(combobox, "1");
    waitFor(() => expect(screen.getByDisplayValue("年少人口")).toHaveLength(1));
    fireEvent.select(combobox, "2");
    waitFor(() => expect(screen.getByDisplayValue("生産年齢人口")).toHaveLength(1));
    fireEvent.select(combobox, "3");
    waitFor(() => expect(screen.getByDisplayValue("老年人口")).toHaveLength(1));
    fireEvent.select(combobox, "0");
    waitFor(() => expect(screen.getByDisplayValue("総人口")).toHaveLength(1));


  });
  it('should render data if user handles checkbox', async () => {
    render(<Home data={mockData} />);

    const checkbox = screen.getByRole('checkbox', {name: "東京都"});
    fireEvent.click(checkbox);
    await waitFor( async () => expect(await screen.getAllByText("東京都")).toHaveLength(2))
    fireEvent.click(checkbox);
    await waitFor( async () => expect(await screen.getAllByText("東京都")).toHaveLength(1))


  });

  // Write more test cases for other interactions and scenarios
});
